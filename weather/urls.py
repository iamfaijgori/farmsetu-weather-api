from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeatherRecordViewSet

router = DefaultRouter()
router.register(r'weather', WeatherRecordViewSet, basename='weather')

urlpatterns = [
    
    path('', include(router.urls)),
]