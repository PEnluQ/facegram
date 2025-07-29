package pinktelegram.facegram.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InviteInfoResponse {
    private String author;
    private String guest;
}
