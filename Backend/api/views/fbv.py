from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})
    return Response({'error': 'Invalid Credentials'}, status=400)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_stats(request):
    data = {
        "total_contacts": request.user.contacts.count(),
        "total_deals": 5,
        "revenue": 50000.0
    }
    return Response(data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
    request.user.auth_token.delete()
    return Response(status=204)