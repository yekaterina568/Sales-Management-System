from django.urls import path
from .views import login_user, get_stats, ContactList, ContactDetail

urlpatterns = [
    path('auth/login/', login_user),
    path('dashboard/', get_stats),
    path('contacts/', ContactList.as_view()),
    path('contacts/<int:pk>/', ContactDetail.as_view()),
    path('auth/logout/', logout_user),
]