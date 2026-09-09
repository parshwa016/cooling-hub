from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Product, Review
from app.schemas import ProductResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/products", tags=["Products"])

class ReviewCreate(BaseModel):
    user_name: str
    rating: int
    title: str
    comment: str

@router.get("", response_model=List[ProductResponse])
def get_products(
    brand: Optional[str] = None,
    ac_type: Optional[str] = None,
    tonnage: Optional[float] = None,
    star_rating: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "popular",
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if brand and brand != "All":
        query = query.filter(Product.brand == brand)
    if ac_type and ac_type != "All":
        query = query.filter(Product.ac_type == ac_type)
    if tonnage and tonnage > 0:
        query = query.filter(Product.tonnage == tonnage)
    if star_rating and star_rating > 0:
        query = query.filter(Product.star_rating == star_rating)
    if min_price:
        query = query.filter(Product.price >= min_price)
    if max_price:
        query = query.filter(Product.price <= max_price)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter((Product.title.ilike(search_pattern)) | (Product.brand.ilike(search_pattern)) | (Product.features.ilike(search_pattern)))

    if sort_by == "price_low":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_high":
        query = query.order_by(Product.price.desc())
    elif sort_by == "rating":
        query = query.order_by(Product.rating.desc())
    else:
        query = query.order_by(Product.reviews_count.desc())

    return query.all()

@router.get("/compare", response_model=List[ProductResponse])
def compare_products(ids: str = Query(...), db: Session = Depends(get_db)):
    id_list = [int(i) for i in ids.split(",") if i.isdigit()]
    if not id_list:
        return []
    products = db.query(Product).filter(Product.id.in_(id_list)).all()
    return products

@router.get("/{product_id}", response_model=ProductResponse)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/{product_id}/reviews")
def add_product_review(product_id: int, req: ReviewCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    review = Review(
        product_id=product_id,
        user_name=req.user_name,
        rating=req.rating,
        title=req.title,
        comment=req.comment
    )
    db.add(review)
    
    # Update product rating average
    reviews = db.query(Review).filter(Review.product_id == product_id).all()
    total_rating = sum(r.rating for r in reviews) + req.rating
    product.reviews_count = len(reviews) + 1
    product.rating = round(total_rating / product.reviews_count, 1)
    
    db.commit()
    return {"message": "Review added successfully"}
