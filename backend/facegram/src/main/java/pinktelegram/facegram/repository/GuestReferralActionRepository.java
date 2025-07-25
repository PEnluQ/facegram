package pinktelegram.facegram.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pinktelegram.facegram.entity.GuestReferralAction;

public interface GuestReferralActionRepository extends JpaRepository<GuestReferralAction, Long> {
}