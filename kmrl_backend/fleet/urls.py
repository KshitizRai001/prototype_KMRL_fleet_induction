from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'trains', views.TrainViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', views.staff_login, name='staff_login'),
    path('auth/logout/', views.staff_logout, name='staff_logout'),
    path('auth/profile/', views.staff_profile, name='staff_profile'),
]