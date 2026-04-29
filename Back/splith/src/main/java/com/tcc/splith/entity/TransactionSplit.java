package com.tcc.splith.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Getter
@Setter
@Table(name = "transaction_splits")
public class TransactionSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @JsonIgnoreProperties({"password", "authorities", "accountNonExpired",
                           "accountNonLocked", "credentialsNonExpired",
                           "enabled", "username",
                           "hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "amount_owed", nullable = false)
    private BigDecimal amountOwed;
}
