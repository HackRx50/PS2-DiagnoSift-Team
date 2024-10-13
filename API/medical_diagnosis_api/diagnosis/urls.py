from django.urls import path
from .views import ProcessImageView

urlpatterns = [
    path('process-image/', ProcessImageView.as_view(), name='process-image'),
]