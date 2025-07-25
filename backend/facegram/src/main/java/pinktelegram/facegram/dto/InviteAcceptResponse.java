package pinktelegram.facegram.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InviteAcceptResponse {
    private String token;
    private String role;
    private String expiresAt;
}