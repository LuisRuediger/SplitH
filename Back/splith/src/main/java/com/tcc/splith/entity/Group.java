package com.tcc.splith.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "split_groups")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    // Relacionamento Muitos-Para-Muitos com os Usuários
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_group", // Nome da tabela intermediária
            joinColumns = @JoinColumn(name = "group_id"), // A chave deste lado (Grupo)
            inverseJoinColumns = @JoinColumn(name = "user_id") // A chave do outro lado (Usuário)
    )
    private Set<User> members = new HashSet<>();
}
