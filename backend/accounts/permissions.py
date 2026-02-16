from rest_framework.permissions import BasePermission
from accounts.models import Role

class IsDoctorOrSuperuser(BasePermission):
    """
    Permission class to allow access only to Doctors and Superusers.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        # Use Role constant
        return request.user.roles.filter(role_name=Role.DOCTOR).exists()