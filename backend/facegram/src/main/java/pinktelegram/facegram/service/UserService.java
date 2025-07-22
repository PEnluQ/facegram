package pinktelegram.facegram.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pinktelegram.facegram.dto.AuthResponse;
import pinktelegram.facegram.entity.Role;
import pinktelegram.facegram.entity.User;
import pinktelegram.facegram.repository.UserRepository;
import pinktelegram.facegram.security.JwtUtil;
import pinktelegram.facegram.util.TelegramInitDataValidator;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final TelegramInitDataValidator validator;

    private static final long ADMIN_ID = 7544899263L;
    private static final String ADMIN_USERNAME = "old1avender";

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

        if (user.isBlocked()) {
            throw new RuntimeException("User blocked");
        }

        if (info.id() == ADMIN_ID && ADMIN_USERNAME.equals(info.username())) {
            if (user.getRole() != Role.ADMIN) {
                user.setRole(Role.ADMIN);
                userRepository.save(user);
            }
        }

        String token = jwtUtil.createToken(user.getTelegramId(), user.getRole());
        return new AuthResponse(token, user.getRole().name());
    }

    public boolean promoteGuestToWageSlave(Long telegramId) {
        User user = userRepository.findById(telegramId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.GUEST) {
            return false;
        }
        user.setRole(Role.WAGESLAVE);
        userRepository.save(user);
        return true;
    }

    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public boolean promoteGuestToWageSlave(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.GUEST) {
            return false;
        }
        user.setRole(Role.WAGESLAVE);
        userRepository.save(user);
        return true;
    }

    public boolean demoteWageSlaveToGuest(Long telegramId) {
        User user = userRepository.findById(telegramId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.WAGESLAVE) {
            return false;
        }
        user.setRole(Role.GUEST);
        userRepository.save(user);
        return true;
    }

    public boolean blockUser(Long telegramId) {
        User user = userRepository.findById(telegramId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.isBlocked()) return false;
        user.setBlocked(true);
        userRepository.save(user);
        return true;
    }

    public boolean unblockUser(Long telegramId) {
        User user = userRepository.findById(telegramId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.isBlocked()) return false;
        user.setBlocked(false);
        userRepository.save(user);
        return true;
    }

    public List<User> searchUsers(String query) {
        return userRepository.findTop10ByUsernameContainingIgnoreCase(query);
    }

    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}