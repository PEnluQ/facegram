package pinktelegram.facegram.notification;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter addEmitter(Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(userId, emitter);
        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        try {
            emitter.send(SseEmitter.event().name("ping").data("connected"));
        } catch (IOException ignored) {
        }
        return emitter;
    }

    public void sendBlocked(Long userId, boolean blocked) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name("blocked").data(Boolean.toString(blocked)));
            } catch (IOException e) {
                emitters.remove(userId);
            }
        }
    }

    public void sendRoleChanged(Long userId, String role) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name("role").data(role));
            } catch (IOException e) {
                emitters.remove(userId);
            }
        }
    }

    public void sendChatClosed(Long userId) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name("chat_closed").data("true"));
            } catch (IOException e) {
                emitters.remove(userId);
            }
        }
    }

    @Scheduled(fixedRate = 15000)
    public void sendPings() {
        emitters.forEach((id, emitter) -> {
            try {
                emitter.send(SseEmitter.event().name("ping").data("keep-alive"));
            } catch (IOException e) {
                emitters.remove(id);
            }
        });
    }
}