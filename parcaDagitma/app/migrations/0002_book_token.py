# Generated by Django 4.1.7 on 2023-03-11 00:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='token',
            field=models.CharField(blank=True, max_length=1000),
        ),
    ]
