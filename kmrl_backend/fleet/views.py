from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Train
from .serializers import TrainSerializer

class TrainViewSet(viewsets.ModelViewSet):
    queryset = Train.objects.all()
    serializer_class = TrainSerializer
    permission_classes = [IsAuthenticated]

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def staff_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(request, username=username, password=password)
    if user is not None and user.is_staff:
        login(request, user)
        return Response({
            'success': True,
            'message': 'Staff login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'is_staff': user.is_staff,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials or not a staff member'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def staff_logout(request):
    logout(request)
    return Response({'success': True, 'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_profile(request):
    user = request.user
    if user.is_staff:
        return Response({
            'id': user.id,
            'username': user.username,
            'is_staff': user.is_staff,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Not a staff member'}, status=status.HTTP_403_FORBIDDEN)