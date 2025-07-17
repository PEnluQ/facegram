package pinktelegram.facegram.controller;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pinktelegram.facegram.dto.AuthResponse;
import pinktelegram.facegram.dto.InitDataRequest;
import pinktelegram.facegram.security.JwtUtil;
import pinktelegram.facegram.service.UserService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    private final UserService userService;
    private final JwtUtil jwtUtil;

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

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        try {
            Jws<Claims> claims = jwtUtil.parseToken(token);
            Long id = Long.parseLong(claims.getPayload().getSubject());
            var user = userService.getUser(id);
            if (user.isBlocked()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            String newToken = jwtUtil.createToken(user.getTelegramId(), user.getRole());
            return ResponseEntity.ok(new AuthResponse(newToken, user.getRole().name()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}