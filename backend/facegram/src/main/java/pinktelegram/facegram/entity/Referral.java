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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id")
    private User guest;

    @Column(nullable = false)
    @Builder.Default
    private boolean activated = false;

    @Column(name = "used_at")
    private java.time.LocalDateTime usedAt;

    @Column(name = "expires_at")
    private java.time.LocalDateTime expiresAt;
}