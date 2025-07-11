package pinktelegram.facegram.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pinktelegram.facegram.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}