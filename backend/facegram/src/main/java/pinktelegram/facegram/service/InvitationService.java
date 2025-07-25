package pinktelegram.facegram.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pinktelegram.facegram.entity.GuestReferralAction;
import pinktelegram.facegram.entity.Referral;
import pinktelegram.facegram.entity.User;
import pinktelegram.facegram.repository.GuestReferralActionRepository;
import pinktelegram.facegram.repository.ReferralRepository;
import pinktelegram.facegram.repository.UserRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvitationService {
    private final ReferralRepository referralRepository;
    private final GuestReferralActionRepository guestReferralActionRepository;
    private final UserRepository userRepository;

    public String createInvite(Long authorId) {
        String token = UUID.randomUUID().toString();
        User author = userRepository.getReferenceById(authorId);
        Referral referral = Referral.builder()
                .token(token)
                .author(author)
                .activated(false)
                .build();
        referralRepository.save(referral);
        return token;
    }

    public Referral activateInvite(String token, Long guestId) {
        var optional = referralRepository.findByToken(token);
        if (optional.isEmpty()) return null;
        Referral ref = optional.get();
        if (ref.isActivated()) {
            return null;
        }
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        ref.setActivated(true);
        ref.setUsedAt(now);
        ref.setExpiresAt(now.plusMinutes(1));
        User guest = userRepository.getReferenceById(guestId);
        ref.setGuest(guest);
        referralRepository.save(ref);

        GuestReferralAction action = GuestReferralAction.builder()
                .referral(ref)
                .guestUser(guest)
                .build();
        guestReferralActionRepository.save(action);

        return ref;
    }
}