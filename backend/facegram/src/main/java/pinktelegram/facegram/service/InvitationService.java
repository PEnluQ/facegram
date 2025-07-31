package pinktelegram.facegram.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pinktelegram.facegram.dto.InviteInfoResponse;
import pinktelegram.facegram.entity.Referral;
import pinktelegram.facegram.entity.User;
import pinktelegram.facegram.repository.ReferralRepository;
import pinktelegram.facegram.repository.UserRepository;

import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InvitationService {
    private final ReferralRepository referralRepository;
    private final UserRepository userRepository;

    @Transactional
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

    @Transactional
    public Referral activateInvite(String token, Long guestId) {
        var optional = referralRepository.findByToken(token);
        if (optional.isEmpty()) return null;
        Referral ref = optional.get();
        if (ref.isActivated()) {
            return null;
        }
        ref.setActivated(true);
        User guest = userRepository.getReferenceById(guestId);
        ref.setGuest(guest);
        referralRepository.save(ref);

        return ref;
    }

    @Transactional(readOnly = true)
    public InviteInfoResponse getInviteInfo(String token) {
        var optional = referralRepository.findByToken(token);
        if (optional.isEmpty()) return null;
        Referral ref = optional.get();
        String author = ref.getAuthor() != null ? ref.getAuthor().getUsername() : null;
        String guest = ref.getGuest() != null ? ref.getGuest().getUsername() : null;
        return new InviteInfoResponse(author, guest);
    }
}