from django.db.models import Count
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Category, Server
from .schema import server_list_docs
from .serializer import CategorySerializer, ServerSerializer


class CategoryListViewSet(viewsets.ViewSet):
    queryset = Category.objects.all()

    @extend_schema(responses=CategorySerializer)
    def list(self, request):
        serializer = CategorySerializer(self.queryset, many=True)
        return Response(serializer.data)


class ServerListViewSet(viewsets.ViewSet):
    """
    A ViewSet for listing or filtering Server objects based on query parameters.

    This ViewSet provides a method to retrieve a list of Server objects with various filtering options.
    The filtering is done based on query parameters passed in the GET request. The available filters include:

    - `category`: Filter servers by their category name.
    - `qty`: Limit the number of Server objects returned.
    - `by_user`: If set to 'true', filter servers where the authenticated user is a member.
    - `by_serverid`: Filter by a specific Server ID.
    - `with_num_members`: If set to 'true', include the number of members in each server in the response.

    Authentication is required for filtering by user or by a specific server ID.
    """

    queryset = Server.objects.all()  # Base queryset for Server objects
    # permission_classes = [IsAuthenticated]

    def get_filtered_queryset(self, request):
        """
        Apply filters to the queryset based on the request's query parameters.
        """

        queryset = self.queryset

        # Extract query parameters
        category = request.query_params.get("category")
        qty = request.query_params.get("qty")
        by_user = request.query_params.get("by_user") == "true"
        by_serverid = request.query_params.get("by_serverid")
        with_num_members = request.query_params.get("with_num_members") == "true"

        # Filter by category if provided
        if category:
            queryset = queryset.filter(category__name=category)

        # Filter by user membership if requested and authenticated
        if by_user:
            if not request.user.is_authenticated:
                raise AuthenticationFailed()
            queryset = queryset.filter(member=request.user.id)

        # Annotate queryset with the number of members if requested
        if with_num_members:
            queryset = queryset.annotate(num_members=Count("member"))

        # Limit the number of results returned if qty is specified
        if qty:
            queryset = queryset[: int(qty)]

        # Filter by server ID if provided and authenticated
        if by_serverid:
            if not request.user.is_authenticated:
                raise AuthenticationFailed()
            queryset = queryset.filter(id=by_serverid)
            if not queryset.exists():
                raise ValidationError(detail=f"Server with id {by_serverid} not found")

        return queryset

    @server_list_docs
    def list(self, request):
        """
        Handle GET requests to list or filter Server objects.

        This method retrieves a list of Server objects based on the filters provided through the query parameters.
        It supports the following filters:

        - category: Filters servers by the specified category name.
        - qty: Limits the number of servers returned to the specified quantity.
        - by_user: If set to 'true', filters servers where the authenticated user is a member.
        - by_serverid: Filters the server list by the specified server ID.
        - with_num_members: If set to 'true', includes the number of members in each server in the response.

        If the by_user or by_serverid filter is used, the user must be authenticated. If the server ID
        provided in by_serverid does not exist, a ValidationError is raised.

        Parameters:
        - request: The HTTP request object containing the query parameters for filtering.

        Returns:
        - Response: A Response object containing the serialized data of the filtered Server objects.
        """

        # Get the filtered queryset
        queryset = self.get_filtered_queryset(request)

        # Serialize the filtered queryset
        serializer = ServerSerializer(
            queryset, many=True, context={"num_members": request.query_params.get("with_num_members") == "true"}
        )

        # Return the serialized data as a response
        return Response(serializer.data)
