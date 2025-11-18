package com.tcc.splith.controller;


import com.tcc.splith.dto.request.LoginRequest;
import com.tcc.splith.dto.request.RegisterUserRequest;
import com.tcc.splith.dto.response.LoginResponse;
import com.tcc.splith.dto.response.RegisterUserResponse;
import com.tcc.splith.entity.User;
import com.tcc.splith.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping ("/auth")
public class AuthController {


    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request){
        return null;
    }

    public ResponseEntity <RegisterUserResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        User newUser = new User();
        newUser.setPassword(request.password());
        newUser.setEmail(request.email());
        newUser.setName(request.name());

        userRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new RegisterUserResponse(
                        newUser.getName(),
                        newUser.getEmail()
                )
        );

    }

}
