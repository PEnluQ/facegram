package pinktelegram.facegram.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pinktelegram.facegram.dto.AuthResponse;
import pinktelegram.facegram.dto.InitDataRequest;
import pinktelegram.facegram.service.UserService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    private final UserService userService;

    @PostMapping("/telegram")
    public ResponseEntity<AuthResponse> telegramAuth(@RequestBody InitDataRequest req) {
        System.out.println("Получен initData: " + req.getInitData());
        try {
            AuthResponse response = userService.authViaTelegram(req.getInitData());
            System.out.println("Авторизация прошла: " + response.getToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Ошибка авторизации: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}