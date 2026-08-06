from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeatherRecordViewSet, reset_cloud_database # <-- Add import here

router = DefaultRouter()
router.register(r'weather', WeatherRecordViewSet, basename='weather')

urlpatterns = [
    # TEMPORARY HIDDEN ROUTE
    path('db-reset-secure-endpoint/', reset_cloud_database, name='db-reset'),
    
    path('', include(router.urls)),
]