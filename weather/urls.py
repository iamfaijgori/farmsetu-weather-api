from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegionViewSet, ParameterViewSet, WeatherRecordViewSet

# A router automatically creates standard RESTful endpoints for our ViewSets
router = DefaultRouter()
router.register(r'regions', RegionViewSet)
router.register(r'parameters', ParameterViewSet)
router.register(r'records', WeatherRecordViewSet, basename='weatherrecord')

urlpatterns = [
    path('', include(router.urls)),
]