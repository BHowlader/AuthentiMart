from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import ProductQuestion, ProductAnswer, Product, User
from app.schemas import (
    ProductQuestionCreate,
    ProductAnswerCreate,
    ProductQuestionResponse,
    ProductAnswerResponse
)
from app.utils import get_current_user, get_current_user_required, get_current_admin

router = APIRouter(prefix="/questions", tags=["Product Q&A"])


@router.get("/product/{product_id}", response_model=List[ProductQuestionResponse])
async def get_product_questions(
    product_id: int,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get approved questions for a product"""
    # Verify product exists
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    questions = db.query(ProductQuestion).filter(
        ProductQuestion.product_id == product_id,
        ProductQuestion.is_approved == True
    ).order_by(
        ProductQuestion.created_at.desc()
    ).offset((page - 1) * limit).limit(limit).all()

    result = []
    for q in questions:
        # Get approved answers
        answers = db.query(ProductAnswer).filter(
            ProductAnswer.question_id == q.id,
            ProductAnswer.is_approved == True
        ).order_by(
            ProductAnswer.is_admin_answer.desc(),
            ProductAnswer.helpful_count.desc()
        ).all()

        result.append({
            "id": q.id,
            "product_id": q.product_id,
            "question": q.question,
            "is_answered": q.is_answered,
            "created_at": q.created_at,
            "user_name": q.user.name if q.user else "Anonymous",
            "answers": [
                {
                    "id": a.id,
                    "answer": a.answer,
                    "is_admin_answer": a.is_admin_answer,
                    "helpful_count": a.helpful_count,
                    "created_at": a.created_at,
                    "user_name": "AuthentiMart" if a.is_admin_answer else (a.user.name if a.user else "Anonymous")
                }
                for a in answers
            ]
        })

    return result


@router.post("/product/{product_id}")
async def ask_question(
    product_id: int,
    data: ProductQuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Ask a question about a product"""
    # Verify product exists
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    question = ProductQuestion(
        product_id=product_id,
        user_id=current_user.id,
        question=data.question,
        is_approved=False  # Requires moderation
    )

    db.add(question)
    db.commit()

    return {"message": "Your question has been submitted and will appear after review"}


@router.post("/{question_id}/answer")
async def answer_question(
    question_id: int,
    data: ProductAnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Answer a question"""
    question = db.query(ProductQuestion).filter(
        ProductQuestion.id == question_id,
        ProductQuestion.is_approved == True
    ).first()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )

    is_admin = current_user.role == "admin"

    answer = ProductAnswer(
        question_id=question_id,
        user_id=current_user.id,
        answer=data.answer,
        is_admin_answer=is_admin,
        is_approved=is_admin  # Admin answers auto-approved
    )

    db.add(answer)

    # Update question as answered if admin
    if is_admin:
        question.is_answered = True

    db.commit()

    return {"message": "Your answer has been submitted" + ("" if is_admin else " and will appear after review")}


@router.post("/answers/{answer_id}/helpful")
async def mark_helpful(
    answer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark an answer as helpful"""
    answer = db.query(ProductAnswer).filter(
        ProductAnswer.id == answer_id,
        ProductAnswer.is_approved == True
    ).first()

    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )

    answer.helpful_count += 1
    db.commit()

    return {"message": "Thank you for your feedback"}


# Admin endpoints
@router.get("/admin/pending")
async def get_pending_questions(
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Get pending questions for moderation (Admin only)"""
    total = db.query(ProductQuestion).filter(
        ProductQuestion.is_approved == False
    ).count()

    questions = db.query(ProductQuestion).filter(
        ProductQuestion.is_approved == False
    ).order_by(
        ProductQuestion.created_at.desc()
    ).offset((page - 1) * limit).limit(limit).all()

    result = []
    for q in questions:
        result.append({
            "id": q.id,
            "product_id": q.product_id,
            "product_name": q.product.name if q.product else None,
            "question": q.question,
            "user_name": q.user.name if q.user else "Anonymous",
            "user_email": q.user.email if q.user else None,
            "created_at": q.created_at
        })

    return {
        "questions": result,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.put("/admin/{question_id}/approve")
async def approve_question(
    question_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Approve a question (Admin only)"""
    question = db.query(ProductQuestion).filter(
        ProductQuestion.id == question_id
    ).first()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )

    question.is_approved = True
    db.commit()

    return {"message": "Question approved"}


@router.delete("/admin/{question_id}")
async def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Delete a question (Admin only)"""
    question = db.query(ProductQuestion).filter(
        ProductQuestion.id == question_id
    ).first()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )

    db.delete(question)
    db.commit()

    return {"message": "Question deleted"}


@router.get("/admin/pending-answers")
async def get_pending_answers(
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Get pending answers for moderation (Admin only)"""
    total = db.query(ProductAnswer).filter(
        ProductAnswer.is_approved == False,
        ProductAnswer.is_admin_answer == False
    ).count()

    answers = db.query(ProductAnswer).filter(
        ProductAnswer.is_approved == False,
        ProductAnswer.is_admin_answer == False
    ).order_by(
        ProductAnswer.created_at.desc()
    ).offset((page - 1) * limit).limit(limit).all()

    result = []
    for a in answers:
        result.append({
            "id": a.id,
            "question_id": a.question_id,
            "question": a.question.question if a.question else None,
            "answer": a.answer,
            "user_name": a.user.name if a.user else "Anonymous",
            "created_at": a.created_at
        })

    return {
        "answers": result,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.put("/admin/answers/{answer_id}/approve")
async def approve_answer(
    answer_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Approve an answer (Admin only)"""
    answer = db.query(ProductAnswer).filter(
        ProductAnswer.id == answer_id
    ).first()

    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )

    answer.is_approved = True

    # Mark question as answered
    question = db.query(ProductQuestion).filter(
        ProductQuestion.id == answer.question_id
    ).first()
    if question:
        question.is_answered = True

    db.commit()

    return {"message": "Answer approved"}
