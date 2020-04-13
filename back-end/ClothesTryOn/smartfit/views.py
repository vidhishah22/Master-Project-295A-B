from django.shortcuts import render
from rest_framework.views import APIView, Response, status
import json
import subprocess
from django.http import HttpResponse

class ClothesTryOnView(APIView):

    def post(self, request, *args, **kwargs):
        print("POST:", request.POST)
        # data = json.loads(request.POST['data'])
        selectedCloth = request.POST['selectedCloth']
        # print("DATA", data)
        print("*********")
        print("Selected Cloth:", selectedCloth)
        print("*********")

        subprocess.call(
            ['smartfit/run_smartfit.sh', '../../front-end/example_person.jpg', '../../front-end/public/images/clothes/'+selectedCloth])
        return Response(status=status.HTTP_201_CREATED)


# def index(request):
#     subprocess.call(['smartfit/run_smartfit.sh', 'smartfit/inputs/example_person.jpg', 'smartfit/inputs/example_clothing.jpg'])
#     return HttpResponse("Hello, world. You're at the polls index.")

