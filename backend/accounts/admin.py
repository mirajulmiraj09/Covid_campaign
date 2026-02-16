from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Role, UserRole, Profile


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display_links = ('role_id', 'role_name')
    list_display = ('role_id', 'role_name', 'permissions')
    search_fields = ('role_name',)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display_links = ('user_id', 'email')
    list_display = ('user_id', 'email', 'is_active', 'is_staff', 'created_at')
    list_filter = ('is_active', 'is_staff', 'roles')
    search_fields = ('email',)
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login', 'created_at')}),
    )
    
    readonly_fields = ('created_at',)
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'is_active', 'is_staff'),
        }),
    )


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display_links = ('user', 'role')
    list_display = ('user', 'role', 'assigned_at')
    list_filter = ('role', 'assigned_at')
    search_fields = ('user__email', 'role__role_name')


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display_links = ('profile_id', 'user')
    list_display = ('profile_id', 'user', 'first_name', 'last_name', 'nid', 'phone', 'gender')
    search_fields = ('first_name', 'last_name', 'nid', 'phone', 'user__email')
    list_filter = ('gender', 'dob')
    readonly_fields = ('profile_id',)