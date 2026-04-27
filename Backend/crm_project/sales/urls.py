from django.urls import path
from .views.fbv import (
    login_view, logout_view,
    deal_list_create, deal_detail,
    get_notes, create_note,
    task_list_create, task_detail,
    my_profile, user_profile, users_list,
    send_collaboration_request, incoming_requests,
    outgoing_requests, respond_to_request,
    search_view
)
from .views.cbv import ContactListAPIView, ContactDetailAPIView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', login_view),
    path('logout/', logout_view),
    path('token/refresh/', TokenRefreshView.as_view()),

    path('profile/me/', my_profile),
    path('profile/<int:pk>/', user_profile),
    path('users/', users_list),

    path('collaboration/request/', send_collaboration_request),
    path('collaboration/incoming/', incoming_requests),
    path('collaboration/outgoing/', outgoing_requests),
    path('collaboration/<int:pk>/respond/', respond_to_request),

    path('search/', search_view),

    path('deals/', deal_list_create),
    path('deals/<int:pk>/', deal_detail),

    path('notes/<int:deal_id>/', get_notes),
    path('notes/create/', create_note),

    path('contacts/', ContactListAPIView.as_view()),
    path('contacts/<int:pk>/', ContactDetailAPIView.as_view()),

    path('tasks/', task_list_create),
    path('tasks/<int:pk>/', task_detail),
]