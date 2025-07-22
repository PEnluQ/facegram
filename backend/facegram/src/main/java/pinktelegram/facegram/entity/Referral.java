package pinktelegram.facegram.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "referrals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Referral {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private long expiresAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean activated = false;
}