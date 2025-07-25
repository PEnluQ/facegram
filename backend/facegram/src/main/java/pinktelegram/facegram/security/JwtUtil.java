package pinktelegram.facegram.security;

import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.springframework.stereotype.Component;
import pinktelegram.facegram.entity.Role;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Component
public class JwtUtil {
    private static final String SECRET = "change-me-very-strong-jwt-secret-key-which-should-be-long-32";
    private static final SecretKey KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    public String createToken(Long telegramId, Role role) {
        return createToken(telegramId, role, 86400, false);
    }

    public String createToken(Long telegramId, Role role, long ttlSeconds) {
        return createToken(telegramId, role, ttlSeconds, false);
    }

    public String createToken(Long telegramId, Role role, long ttlSeconds, boolean invite) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(ttlSeconds);

        JwtBuilder builder = Jwts.builder()
                .subject(String.valueOf(telegramId))
                .claim("role", role.name())
                .claim("created", now.toString())
                .claim("exp", expiry.getEpochSecond())
                .claim("invite", invite)
                .signWith(KEY);

        return builder.compact();
    }

    public Jws<Claims> parseToken(String token) {
        return Jwts.parser()
                .verifyWith(KEY)
                .build()
                .parseSignedClaims(token);
    }
}