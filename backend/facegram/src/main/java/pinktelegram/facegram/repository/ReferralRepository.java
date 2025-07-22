package pinktelegram.facegram.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pinktelegram.facegram.entity.Referral;

import java.util.Optional;

public interface ReferralRepository extends JpaRepository<Referral, Long> {
    Optional<Referral> findByToken(String token);
}