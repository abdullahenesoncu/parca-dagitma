from django.db import models

class BaseModel(models.Model):
   class Meta:
      abstract = True
   createdDate = models.DateTimeField(auto_now_add=True)
   updatedDate = models.DateTimeField(auto_now=True)
