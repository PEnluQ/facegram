package pinktelegram.facegram.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pinktelegram.facegram.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {}