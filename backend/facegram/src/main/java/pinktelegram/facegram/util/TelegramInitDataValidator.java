package pinktelegram.facegram.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class TelegramInitDataValidator {

    public record TelegramUserInfo(Long id, String username) {}

    public TelegramUserInfo validate(String initData, String botToken) {
        try {
            // 1. Разбиваем параметры без декодирования
            Map<String, String> params = new LinkedHashMap<>();
            for (String pair : initData.split("&")) {
                int idx = pair.indexOf("=");
                String key = (idx > 0) ? pair.substring(0, idx) : pair;
                String value = (idx > 0 && pair.length() > idx + 1) ? pair.substring(idx + 1) : "";
                params.put(key, value);
            }

            String receivedHash = params.remove("hash");
            if (receivedHash == null) return null;

            // 2. Формируем data_check_string из оригинальных значений
            List<String> keys = new ArrayList<>(params.keySet());
            Collections.sort(keys);

            StringBuilder dataCheckBuilder = new StringBuilder();
            for (String key : keys) {
                if (dataCheckBuilder.length() > 0) dataCheckBuilder.append("\n");
                dataCheckBuilder.append(key).append("=").append(params.get(key));
            }
            String dataCheckString = dataCheckBuilder.toString();

            // 4. Вычисляем HMAC
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec("WebAppData".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] secretKeyBytes = mac.doFinal(botToken.getBytes(StandardCharsets.UTF_8));

            // 4. Вычисляем HMAC от data_check_string этим ключом
            mac.reset();
            mac.init(new SecretKeySpec(secretKeyBytes, "HmacSHA256"));
            String computedHash = bytesToHex(mac.doFinal(dataCheckString.getBytes(StandardCharsets.UTF_8)));

            // 5. Сравниваем хэши
            if (computedHash.equalsIgnoreCase(receivedHash)) {
                System.err.println("Hash mismatch! Expected: " + receivedHash + " Computed: " + computedHash);
                return null;
            }

            // 6. Декодируем и парсим user
            String userJson = URLDecoder.decode(params.get("user"), StandardCharsets.UTF_8);
            Map<?, ?> userMap = new ObjectMapper().readValue(userJson, Map.class);
            return new TelegramUserInfo(
                    ((Number) userMap.get("id")).longValue(),
                    (String) userMap.get("username")
            );
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}