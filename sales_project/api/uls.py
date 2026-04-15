from django.urls import path
from .views import login, get_products, create_product, CustomerView

urlpatterns = [
    path('login/', login),
    path('products/', get_products),
    path('products/create/', create_product),
    path('customers/', CustomerView.as_view()),
]