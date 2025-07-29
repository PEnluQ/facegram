package pinktelegram.facegram.controller;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pinktelegram.facegram.dto.InviteAcceptResponse;
import pinktelegram.facegram.dto.InviteInfoResponse;
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
            Long authorId = Long.parseLong(claims.getPayload().getSubject());
            String invite = invitationService.createInvite(authorId);
            String link = "https://t.me/FaceGrammBot/faces?startapp=chat_invite_" + invite;
            return ResponseEntity.ok(link);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/accept")
    public ResponseEntity<InviteAcceptResponse> accept(@RequestParam("token") String inviteToken,
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
            var referral = invitationService.activateInvite(inviteToken, userId);
            if (referral == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            String newToken = jwtUtil.createToken(userId, Role.GUEST, 86400, true);
            return ResponseEntity.ok(new InviteAcceptResponse(newToken, Role.GUEST.name()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/info/{token}")
    public ResponseEntity<?> info(@PathVariable("token") String inviteToken,
                                  @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        try {
            jwtUtil.parseToken(token);
            InviteInfoResponse info = invitationService.getInviteInfo(inviteToken);
            if (info == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}