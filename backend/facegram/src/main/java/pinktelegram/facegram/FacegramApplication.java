package pinktelegram.facegram;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FacegramApplication {

    public static void main(String[] args) {
        SpringApplication.run(FacegramApplication.class, args);
    }
}