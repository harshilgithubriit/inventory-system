from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["orders"])


@router.post("/orders", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    order_items_data = []
    product_ids = [item.product_id for item in order.items]
    products = {p.id: p for p in db.query(models.Product).filter(models.Product.id.in_(product_ids)).all()}

    for item in order.items:
        product = products.get(item.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found"
            )
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}'. Available: {product.quantity}, requested: {item.quantity}"
            )
        subtotal = product.price * item.quantity
        order_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price,
            "subtotal": subtotal
        })

    total_amount = sum(item["subtotal"] for item in order_items_data)

    db_order = models.Order(
        customer_id=order.customer_id,
        total_amount=total_amount,
        status="confirmed"
    )
    db.add(db_order)
    db.flush()

    db_order_items = []
    for item_data in order_items_data:
        db_order_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            subtotal=item_data["subtotal"]
        )
        db.add(db_order_item)
        db_order_items.append(db_order_item)

        item_data["product"].quantity -= item_data["quantity"]

    db.commit()
    db.refresh(db_order)

    return _format_order_response(db_order, customer, db_order_items)


@router.get("/orders", response_model=List[schemas.OrderListResponse])
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "customer_id": order.customer_id,
            "customer_name": order.customer.name,
            "total_amount": order.total_amount,
            "status": order.status,
            "created_at": order.created_at
        })
    return result


@router.get("/orders/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.product),
        joinedload(models.Order.customer)
    ).filter(models.Order.id == order_id).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return _format_order_response(order, order.customer, order.items)


@router.delete("/orders/{order_id}", status_code=status.HTTP_200_OK)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    ).filter(models.Order.id == order_id).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    for item in order.items:
        product = item.product
        product.quantity += item.quantity

    db.delete(order)
    db.commit()
    return {"message": "Order cancelled successfully"}


def _format_order_response(order, customer, items):
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "customer_name": customer.name if customer else order.customer.name,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else f"Product {item.product_id}",
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.subtotal
            }
            for item in items
        ]
    }
