from django.urls import path
from .views.fbv import login_view, logout_view, deal_list_create, deal_detail, get_notes, create_note, task_list_create, task_detail
from .views.cbv import ContactListAPIView, ContactDetailAPIView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', login_view),
    path('logout/', logout_view),
    path('deals/', deal_list_create),
    path('deals/<int:pk>/', deal_detail),
    path('notes/<int:deal_id>/', get_notes),
    path('notes/create/', create_note),
    path('contacts/', ContactListAPIView.as_view()),
    path('contacts/<int:pk>/', ContactDetailAPIView.as_view()),
    path('tasks/', task_list_create),
    path('tasks/<int:pk>/', task_detail),
    path('token/refresh/', TokenRefreshView.as_view()),
]