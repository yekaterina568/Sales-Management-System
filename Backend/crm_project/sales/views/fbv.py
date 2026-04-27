from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework_simplejwt.tokens import RefreshToken
from ..models import Deal, Note, Task, UserProfile, CollaborationRequest
from ..serializers import (
    DealSerializer, NoteSerializer, LoginRequestSerializer, TaskSerializer,
    UserSerializer, UserProfileUpdateSerializer, CollaborationRequestSerializer
)


@api_view(['POST'])
def login_view(request):
    serializer = LoginRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = authenticate(
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password']
    )
    if user is None:
        return Response({'error': 'Invalid credentials'}, status=400)
    UserProfile.objects.get_or_create(user=user)
    refresh = RefreshToken.for_user(user)
    return Response({'access': str(refresh.access_token), 'refresh': str(refresh)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        token = RefreshToken(request.data.get('refresh'))
        token.blacklist()
        return Response({'message': 'Logged out'})
    except:
        return Response({'error': 'Invalid token'}, status=400)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def my_profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)

    serializer = UserProfileUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    user = request.user
    if 'first_name' in data: user.first_name = data['first_name']
    if 'last_name' in data: user.last_name = data['last_name']
    if 'email' in data: user.email = data['email']
    user.save()

    if 'role' in data: profile.role = data['role']
    if 'avatar_url' in data: profile.avatar_url = data['avatar_url']
    if 'bio' in data: profile.bio = data['bio']
    if 'phone' in data: profile.phone = data['phone']
    if 'company' in data: profile.company = data['company']
    profile.save()

    return Response(UserSerializer(request.user).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request, pk):
    user = get_object_or_404(User, pk=pk)
    return Response(UserSerializer(user).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    users = User.objects.exclude(id=request.user.id).select_related('profile')
    return Response(UserSerializer(users, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_collaboration_request(request):
    to_user_id = request.data.get('to_user_id')
    message = request.data.get('message', '')

    if not to_user_id:
        return Response({'error': 'to_user_id required'}, status=400)

    to_user = get_object_or_404(User, pk=to_user_id)

    if to_user == request.user:
        return Response({'error': 'Cannot send request to yourself'}, status=400)

    req, created = CollaborationRequest.objects.get_or_create(
        from_user=request.user,
        to_user=to_user,
        defaults={'message': message}
    )
    if not created:
        return Response({'error': 'Request already sent'}, status=400)

    return Response(CollaborationRequestSerializer(req).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def incoming_requests(request):
    reqs = CollaborationRequest.objects.filter(
        to_user=request.user
    ).select_related('from_user', 'from_user__profile')
    return Response(CollaborationRequestSerializer(reqs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def outgoing_requests(request):
    reqs = CollaborationRequest.objects.filter(
        from_user=request.user
    ).select_related('to_user', 'to_user__profile')
    return Response(CollaborationRequestSerializer(reqs, many=True).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def respond_to_request(request, pk):
    req = get_object_or_404(CollaborationRequest, pk=pk, to_user=request.user)
    action = request.data.get('action')
    if action == 'accept':
        req.status = 'accepted'
    elif action == 'decline':
        req.status = 'declined'
    else:
        return Response({'error': 'action must be accept or decline'}, status=400)
    req.save()
    return Response(CollaborationRequestSerializer(req).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_view(request):
    q = request.query_params.get('q', '').strip()
    if not q:
        return Response({'deals': [], 'contacts': [], 'tasks': [], 'users': []})

    deals = Deal.objects.filter(user=request.user).filter(
        Q(title__icontains=q) | Q(stage__icontains=q)
    )[:5]

    from ..models import Contact
    contacts = Contact.objects.filter(user=request.user).filter(
        Q(full_name__icontains=q) | Q(company__icontains=q) | Q(email__icontains=q)
    )[:5]

    tasks = Task.objects.filter(user=request.user).filter(
        Q(title__icontains=q)
    )[:5]

    users = User.objects.exclude(id=request.user.id).filter(
        Q(username__icontains=q) | Q(first_name__icontains=q) |
        Q(last_name__icontains=q) | Q(email__icontains=q)
    )[:5]

    return Response({
        'deals': DealSerializer(deals, many=True).data,
        'contacts': [{'id': c.id, 'full_name': c.full_name, 'company': c.company} for c in contacts],
        'tasks': [{'id': t.id, 'title': t.title} for t in tasks],
        'users': UserSerializer(users, many=True).data,
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def deal_list_create(request):
    if request.method == 'GET':
        deals = Deal.objects.filter(user=request.user)
        return Response(DealSerializer(deals, many=True).data)
    serializer = DealSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def deal_detail(request, pk):
    deal = get_object_or_404(Deal, pk=pk, user=request.user)
    if request.method == 'GET':
        return Response(DealSerializer(deal).data)
    elif request.method == 'PUT':
        serializer = DealSerializer(deal, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    deal.delete()
    return Response(status=204)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notes(request, deal_id):
    notes = Note.objects.filter(deal_id=deal_id)
    return Response(NoteSerializer(notes, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_note(request):
    serializer = NoteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(author=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list_create(request):
    if request.method == 'GET':
        return Response(TaskSerializer(Task.objects.filter(user=request.user), many=True).data)
    serializer = TaskSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):
    task = get_object_or_404(Task, pk=pk, user=request.user)
    if request.method == 'PUT':
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    task.delete()
    return Response(status=204)