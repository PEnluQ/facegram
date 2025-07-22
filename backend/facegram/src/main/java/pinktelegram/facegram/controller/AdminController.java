package pinktelegram.facegram.controller;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pinktelegram.facegram.security.JwtUtil;
import pinktelegram.facegram.service.UserService;
import pinktelegram.facegram.notification.NotificationService;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;

    @PostMapping("/users/{id}/wageslave")
    public ResponseEntity<String> promote(@PathVariable("id") Long id,
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
            boolean changed = userService.promoteGuestToWageSlave(id);
            if (changed) {
                notificationService.sendRoleChanged(id, "WAGESLAVE");
            }
            return ResponseEntity.ok(changed ? "done" : "already");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }


    @PostMapping("/users/{id}/guest")
    public ResponseEntity<String> demote(@PathVariable("id") Long id,
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
            boolean changed = userService.demoteWageSlaveToGuest(id);
            if (changed) {
                notificationService.sendRoleChanged(id, "GUEST");
            }
            return ResponseEntity.ok(changed ? "done" : "already");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/users/{id}/block")
    public ResponseEntity<String> block(@PathVariable("id") Long id,
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
            boolean changed = userService.blockUser(id);
            if (changed) {
                notificationService.sendBlocked(id, true);
            }
            return ResponseEntity.ok(changed ? "done" : "already");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/users/{id}/unblock")
    public ResponseEntity<String> unblock(@PathVariable("id") Long id,
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
            boolean changed = userService.unblockUser(id);
            if (changed) {
                notificationService.sendBlocked(id, false);
            }
            return ResponseEntity.ok(changed ? "done" : "already");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/users/wageslave")
    public ResponseEntity<String> promoteByUsername(@RequestParam("username") String username,
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
            boolean changed = userService.promoteGuestToWageSlave(username);
            if (changed) {
                Long id = userService.getByUsername(username).getTelegramId();
                notificationService.sendRoleChanged(id, "WAGESLAVE");
            }
            return ResponseEntity.ok(changed ? "done" : "already");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> searchUsers(@RequestParam("q") String query,
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
            return ResponseEntity.ok(userService.searchUsers(query));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUser(@PathVariable("id") Long id,
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
            return ResponseEntity.ok(userService.getUser(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}