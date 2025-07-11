package pinktelegram.facegram.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pinktelegram.facegram.dto.AuthResponse;
import pinktelegram.facegram.entity.Role;
import pinktelegram.facegram.entity.User;
import pinktelegram.facegram.repository.UserRepository;
import pinktelegram.facegram.security.JwtUtil;
import pinktelegram.facegram.util.TelegramInitDataValidator;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final TelegramInitDataValidator validator;

    public AuthResponse authViaTelegram(String initData) {
        var info = validator.validate(initData, "7898493285:AAH0JtNGYfavuDAJm8Pud57UEwftaY8U8BY");
        if (info == null) throw new RuntimeException("Invalid Telegram Auth");

        User user = userRepository.findById(info.id())
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .telegramId(info.id())
                                .username(info.username())
                                .role(Role.GUEST)
                                .build()));

        String token = jwtUtil.createToken(user.getTelegramId(), user.getRole());
        return new AuthResponse(token, user.getRole().name());
    }

    public void promoteGuestToWageSlave(Long telegramId) {
        User user = userRepository.findById(telegramId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.GUEST) {
            throw new RuntimeException("User is not GUEST");
        }
        user.setRole(Role.WAGESLAVE);
        userRepository.save(user);
    }

    public void promoteGuestToWageSlave(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.GUEST) {
            throw new RuntimeException("User is not GUEST");
        }
        user.setRole(Role.WAGESLAVE);
        userRepository.save(user);
    }
}