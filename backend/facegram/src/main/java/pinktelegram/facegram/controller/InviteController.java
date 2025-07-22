package pinktelegram.facegram.controller;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pinktelegram.facegram.dto.AuthResponse;
import pinktelegram.facegram.entity.Role;
import pinktelegram.facegram.security.JwtUtil;
import pinktelegram.facegram.service.InvitationService;

@RestController
@RequestMapping("/invite")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InviteController {
    private final InvitationService invitationService;
    private final JwtUtil jwtUtil;

    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        try {
            Jws<Claims> claims = jwtUtil.parseToken(token);
            String role = claims.getPayload().get("role", String.class);
            if (!"WAGESLAVE".equals(role) && !"ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            String invite = invitationService.createInvite(5);
            String link = "https://t.me/FaceGrammBot/faces?startapp=chat_invite_" + invite;
            return ResponseEntity.ok(link);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/accept")
    public ResponseEntity<AuthResponse> accept(@RequestParam("token") String inviteToken,
                                               @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        try {
            Jws<Claims> claims = jwtUtil.parseToken(token);
            Long userId = Long.parseLong(claims.getPayload().getSubject());
            String role = claims.getPayload().get("role", String.class);
            if (!"GUEST".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            if (!invitationService.validateInvite(inviteToken)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            String newToken = jwtUtil.createToken(userId, Role.CLIENT, 5);
            return ResponseEntity.ok(new AuthResponse(newToken, Role.CLIENT.name()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}