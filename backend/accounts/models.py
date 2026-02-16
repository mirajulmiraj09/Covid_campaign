from django.db import models
from django.contrib.auth.models import AbstractBaseUser,PermissionsMixin
from accounts.managers import MyUserManager

"""For Role base Access and Permission"""
class Role(models.Model):
    DOCTOR = 'Doctor'
    PATIENT = 'Patient'

    ROLE_CHOICES = [
        (DOCTOR, 'Doctor'),
        (PATIENT, 'Patient'),
    ]
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    permissions = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'roles'
    
    def __str__(self):
        return self.role_name


"""Custom User Model with Role-based Access Control"""
class User(AbstractBaseUser,PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=255, unique=True, db_index=True)
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    roles = models.ManyToManyField(Role, through='UserRole', related_name='users')
    
    objects = MyUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return self.email


"""Through model to link User and Role with additional fields if needed in the future"""
class UserRole(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE )
    role = models.ForeignKey(Role,on_delete=models.CASCADE )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_roles'
        unique_together = ('user', 'role')

    def __str__(self):
        return f"{self.user.email} - {self.role.role_name}"
    
"""Profile model to store additional user information, linked to User via OneToOneField"""
class Profile(models.Model):
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    
    profile_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    nid = models.CharField(max_length=20, unique=True, db_index=True)
    dob = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    specialization = models.CharField(max_length=100, null=True, blank=True)
    medical_history = models.TextField(null=True, blank=True)
    profile_pic_url = models.ImageField(upload_to='profiles/', null=True, blank=True)
    
    class Meta:
        db_table = 'profiles'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"