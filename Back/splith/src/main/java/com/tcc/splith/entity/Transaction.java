package com.tcc.splith.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter
@Setter
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String description;
    private BigDecimal amount;

    @Column(name = "transaction_date")
    private LocalDate date;

    private String category;
    private String account;

    @Column(name = "group_name")
    private String groupName;

    private String type; // INCOME ou EXPENSE

    public String getPaidByName() {
        return this.user != null ? this.user.getName() : "Desconhecido";
    }
}
