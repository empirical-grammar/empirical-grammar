# Generated by Django 2.2.5 on 2019-12-19 22:18

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True,
                 serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('title', models.TextField()),
                ('flag',
                 models.TextField(choices=[('archived', 'archived'),
                                           ('beta', 'beta'),
                                           ('draft', 'draft'),
                                           ('production', 'production')])),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
