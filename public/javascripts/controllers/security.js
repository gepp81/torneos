function SignUpController($localStorage, $scope, $auth, $location) {
    var vm = this;
    this.signup = function(valid) {
        if (valid) {
            $auth.signup({
                    user: vm.user,
                    password: vm.password,
                    passwordRepeat: vm.passwordRepeat,
                    email: vm.email,
                    firstName: vm.firstName,
                    lastName: vm.lastName
                })
                .then(function(response) {
                    $localStorage.permissions = response.data.permissions;
                    $localStorage.admin = response.data.admin;
                    $location.path("/home");
                })
                .catch(function(data) {
                    $scope.errors = data.data;
                });
        }
    }
}

function LoginController($localStorage, $auth, $location) {
    var vm = this;
    this.login = function(valid) {
        if (valid) {
            $auth.login({
                    user: vm.user,
                    password: vm.password
                })
                .then(function(response) {
                    $localStorage.permissions = response.data.permissions;
                    $localStorage.admin = response.data.admin;
                    $location.path("/home")
                })
                .catch(function(response) {});
        }
    }
}

function LogoutController($auth, $location, $localStorage) {
    $auth.logout()
        .then(function() {
            $location.path("/")
        });
    $localStorage.$reset();
}

function AuthController($auth, $location, $scope, $localStorage) {
    $scope.isAuthenticated = function() {
        return $auth.isAuthenticated();
    };

    $scope.hasPermission = function(permission) {
        if ($localStorage.admin) {
            return true;
        } else {
            if ($localStorage.permissions) {
                if ($localStorage.permissions.indexOf(permission) == -1) {
                    return false;
                }
                return true;
            }
        }
        return false;
    }
};