package pinktelegram.facegram.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pinktelegram.facegram.entity.Referral;
import pinktelegram.facegram.repository.ReferralRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvitationService {
    private final ReferralRepository referralRepository;

    public String createInvite(long ttlSeconds) {
        String token = UUID.randomUUID().toString();
        long expires = System.currentTimeMillis() + ttlSeconds * 1000;
        Referral referral = Referral.builder()
                .token(token)
                .expiresAt(expires)
                .activated(false)
                .build();
        referralRepository.save(referral);
        return token;
    }

    public boolean validateInvite(String token) {
        var optional = referralRepository.findByToken(token);
        if (optional.isEmpty()) return false;
        Referral ref = optional.get();
        if (ref.isActivated() || ref.getExpiresAt() < System.currentTimeMillis()) {
            return false;
        }
        ref.setActivated(true);
        referralRepository.save(ref);
        return true;
    }
}