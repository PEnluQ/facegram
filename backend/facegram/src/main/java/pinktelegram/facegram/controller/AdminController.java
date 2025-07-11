package pinktelegram.facegram.controller;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pinktelegram.facegram.security.JwtUtil;
import pinktelegram.facegram.service.UserService;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/users/{id}/wageslave")
    public ResponseEntity<Void> promote(@PathVariable("id") Long id,
                                        @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        try {
            Jws<Claims> claims = jwtUtil.parseToken(token);
            String role = claims.getPayload().get("role", String.class);
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            userService.promoteGuestToWageSlave(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/users/wageslave")
    public ResponseEntity<Void> promoteByUsername(@RequestParam("username") String username,
                                                  @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        try {
            Jws<Claims> claims = jwtUtil.parseToken(token);
            String role = claims.getPayload().get("role", String.class);
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            userService.promoteGuestToWageSlave(username);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
