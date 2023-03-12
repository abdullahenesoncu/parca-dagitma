from django.contrib import admin
from app.models import *

admin.site.register( BookTemplate )
admin.site.register( BookPartTemplate )
admin.site.register( Book )
admin.site.register( BookPart )