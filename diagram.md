flowchart TD

subgraph group_ui["Browser / UI"]
  node_index_html["Home page<br/>static page<br/>[index.html]"]
  node_dashboard_html["Dashboard<br/>static page<br/>[dashboard.html]"]
  node_api_js["API client<br/>browser script<br/>[api.js]"]
  node_auth_js["Auth script<br/>browser script<br/>[auth.js]"]
  node_dashboard_js["Dashboard script<br/>browser script<br/>[dashboard.js]"]
  node_style_css["Styles<br/>[style.css]"]
end

subgraph group_api["Node / Express API"]
  node_server_js["server.js<br/>node entrypoint<br/>[server.js]"]
  node_app_js["Express app<br/>express composition<br/>[app.js]"]
  node_auth_routes["Auth routes<br/>api routes<br/>[authRoutes.js]"]
  node_resource_routes["Resource routes<br/>api routes<br/>[resourceRoutes.js]"]
  node_user_routes["User routes<br/>api routes<br/>[userRoutes.js]"]
  node_auth_controller["Auth controller<br/>request handler<br/>[authController.js]"]
  node_resource_controller["Resource controller<br/>request handler"]
  node_user_controller["User controller<br/>request handler<br/>[userController.js]"]
  node_auth_middleware["Auth middleware<br/>jwt guard<br/>[authMiddleware.js]"]
  node_error_middleware["Error middleware<br/>api errors<br/>[errorMiddleware.js]"]
  node_helpers_js["Helpers<br/>shared utils<br/>[helpers.js]"]
  node_ml_service["ML service<br/>node client<br/>[mlService.js]"]
end

subgraph group_data["MongoDB Persistence"]
  node_db_js[("DB config<br/>mongodb connector<br/>[db.js]")]
  node_user_model[("User<br/>mongoose model<br/>[User.js]")]
  node_resource_model[("Resource<br/>mongoose model<br/>[Resource.js]")]
end

subgraph group_ml["Python ML Service"]
  node_ml_app["Flask app<br/>python entrypoint<br/>[app.py]"]
  node_train_py["Training pipeline<br/>offline trainer<br/>[train.py]"]
  node_model_pkl[("Model artifact<br/>serialized model<br/>[model.pkl]")]
end

node_resources_json["Seed data<br/>dataset<br/>[resources.json]"]

node_server_js -->|"starts"| node_app_js
node_app_js -->|"connects"| node_db_js
node_app_js -->|"mounts"| node_auth_routes
node_app_js -->|"mounts"| node_resource_routes
node_app_js -->|"mounts"| node_user_routes
node_app_js -->|"uses"| node_error_middleware
node_auth_routes -->|"protects"| node_auth_middleware
node_auth_routes -->|"dispatches"| node_auth_controller
node_resource_routes -->|"protects"| node_auth_middleware
node_resource_routes -->|"dispatches"| node_resource_controller
node_user_routes -->|"protects"| node_auth_middleware
node_user_routes -->|"dispatches"| node_user_controller
node_auth_controller -->|"reads/writes"| node_user_model
node_resource_controller -->|"reads/writes"| node_resource_model
node_user_controller -->|"reads/writes"| node_user_model
node_resource_controller -->|"uses"| node_helpers_js
node_resource_controller -->|"requests prediction"| node_ml_service
node_ml_service -->|"calls"| node_ml_app
node_ml_app -->|"loads"| node_model_pkl
node_train_py -->|"produces"| node_model_pkl
node_dashboard_html -->|"loads"| node_dashboard_js
node_index_html -->|"loads"| node_auth_js
node_dashboard_html -->|"uses"| node_api_js
node_index_html -->|"uses"| node_api_js
node_dashboard_html -->|"styles"| node_style_css
node_index_html -->|"styles"| node_style_css
node_api_js -->|"calls"| node_app_js
node_auth_js -->|"calls"| node_app_js
node_dashboard_js -->|"calls"| node_app_js
node_app_js -->|"serves"| node_index_html
node_app_js -->|"serves"| node_dashboard_html
node_resource_controller -->|"feeds dashboard"| node_resource_model
node_resources_json -.->|"seeds"| node_resource_model

click node_server_js "https://github.com/pratibimb-prog/resource-management/blob/main/server.js"
click node_app_js "https://github.com/pratibimb-prog/resource-management/blob/main/src/app.js"
click node_db_js "https://github.com/pratibimb-prog/resource-management/blob/main/src/config/db.js"
click node_auth_routes "https://github.com/pratibimb-prog/resource-management/blob/main/src/routes/authRoutes.js"
click node_resource_routes "https://github.com/pratibimb-prog/resource-management/blob/main/src/routes/resourceRoutes.js"
click node_user_routes "https://github.com/pratibimb-prog/resource-management/blob/main/src/routes/userRoutes.js"
click node_auth_controller "https://github.com/pratibimb-prog/resource-management/blob/main/src/controllers/authController.js"
click node_resource_controller "https://github.com/pratibimb-prog/resource-management/blob/main/src/controllers/resourceController.js"
click node_user_controller "https://github.com/pratibimb-prog/resource-management/blob/main/src/controllers/userController.js"
click node_auth_middleware "https://github.com/pratibimb-prog/resource-management/blob/main/src/middleware/authMiddleware.js"
click node_error_middleware "https://github.com/pratibimb-prog/resource-management/blob/main/src/middleware/errorMiddleware.js"
click node_user_model "https://github.com/pratibimb-prog/resource-management/blob/main/src/models/User.js"
click node_resource_model "https://github.com/pratibimb-prog/resource-management/blob/main/src/models/Resource.js"
click node_helpers_js "https://github.com/pratibimb-prog/resource-management/blob/main/src/utils/helpers.js"
click node_ml_service "https://github.com/pratibimb-prog/resource-management/blob/main/src/services/mlService.js"
click node_index_html "https://github.com/pratibimb-prog/resource-management/blob/main/public/index.html"
click node_dashboard_html "https://github.com/pratibimb-prog/resource-management/blob/main/public/dashboard.html"
click node_api_js "https://github.com/pratibimb-prog/resource-management/blob/main/public/js/api.js"
click node_auth_js "https://github.com/pratibimb-prog/resource-management/blob/main/public/js/auth.js"
click node_dashboard_js "https://github.com/pratibimb-prog/resource-management/blob/main/public/js/dashboard.js"
click node_style_css "https://github.com/pratibimb-prog/resource-management/blob/main/public/css/style.css"
click node_ml_app "https://github.com/pratibimb-prog/resource-management/blob/main/ml/app.py"
click node_train_py "https://github.com/pratibimb-prog/resource-management/blob/main/ml/train.py"
click node_model_pkl "https://github.com/pratibimb-prog/resource-management/blob/main/ml/model.pkl"
click node_resources_json "https://github.com/pratibimb-prog/resource-management/blob/main/resources.json"

classDef toneNeutral fill:#f8fafc,stroke:#334155,stroke-width:1.5px,color:#0f172a
classDef toneBlue fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px,color:#172554
classDef toneAmber fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f
classDef toneMint fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d
classDef toneRose fill:#ffe4e6,stroke:#e11d48,stroke-width:1.5px,color:#881337
classDef toneIndigo fill:#e0e7ff,stroke:#4f46e5,stroke-width:1.5px,color:#312e81
classDef toneTeal fill:#ccfbf1,stroke:#0f766e,stroke-width:1.5px,color:#134e4a
class node_index_html,node_dashboard_html,node_api_js,node_auth_js,node_dashboard_js,node_style_css toneBlue
class node_server_js,node_app_js,node_auth_routes,node_resource_routes,node_user_routes,node_auth_controller,node_resource_controller,node_user_controller,node_auth_middleware,node_error_middleware,node_helpers_js,node_ml_service toneAmber
class node_db_js,node_user_model,node_resource_model toneMint
class node_ml_app,node_train_py,node_model_pkl toneRose
class node_resources_json toneNeutral
